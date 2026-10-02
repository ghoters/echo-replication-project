ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'custom_figurine',
  ADD COLUMN IF NOT EXISTS estimated_start date,
  ADD COLUMN IF NOT EXISTS estimated_end date,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS revision_rounds_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_revision_unlocked boolean NOT NULL DEFAULT false;

UPDATE public.orders SET status = 'Opłacone' WHERE status = 'W realizacji';

ALTER TABLE public.orders ADD CONSTRAINT orders_status_workflow_check CHECK (status IN ('Opłacone','Projektowanie','Wizualizacja','Poprawki','Modelowanie','Druk','Malowanie','Gotowe','Wysłane','Anulowane')) NOT VALID;
ALTER TABLE public.orders ADD CONSTRAINT orders_revision_rounds_nonnegative CHECK (revision_rounds_used >= 0) NOT VALID;
ALTER TABLE public.orders ADD CONSTRAINT orders_prices_nonnegative CHECK (figurine_price >= 0 AND delivery_price >= 0) NOT VALID;

CREATE TABLE public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_id uuid,
  event_type text NOT NULL,
  title text NOT NULL,
  details text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read order events" ON public.order_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins read order events" ON public.order_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert order events" ON public.order_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_visualizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  version integer NOT NULL,
  name text NOT NULL,
  state text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL,
  sent_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id, version),
  CHECK (version > 0),
  CHECK (state IN ('draft','awaiting_review','changes_requested','accepted','superseded'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_visualizations TO authenticated;
GRANT ALL ON public.order_visualizations TO service_role;
ALTER TABLE public.order_visualizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read order visualizations" ON public.order_visualizations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins manage order visualizations" ON public.order_visualizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.visualization_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visualization_id uuid NOT NULL REFERENCES public.order_visualizations(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visualization_images TO authenticated;
GRANT ALL ON public.visualization_images TO service_role;
ALTER TABLE public.visualization_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read visualization images" ON public.visualization_images FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.order_visualizations v JOIN public.orders o ON o.id = v.order_id WHERE v.id = visualization_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins manage visualization images" ON public.visualization_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.revision_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  visualization_id uuid REFERENCES public.order_visualizations(id) ON DELETE SET NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  message text NOT NULL,
  round_number integer NOT NULL,
  is_paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted',
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (round_number > 0),
  CHECK (status IN ('submitted','awaiting_payment','approved','resolved'))
);
GRANT SELECT, INSERT, UPDATE ON public.revision_requests TO authenticated;
GRANT ALL ON public.revision_requests TO service_role;
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read revision requests" ON public.revision_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage revision requests" ON public.revision_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (category IN ('general','visualization','revision_reference'))
);
GRANT SELECT, INSERT, DELETE ON public.order_files TO authenticated;
GRANT ALL ON public.order_files TO service_role;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read order files" ON public.order_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Owners add revision references" ON public.order_files FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid() AND category = 'revision_reference' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins manage order files" ON public.order_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  email_pending boolean NOT NULL DEFAULT true,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipients read notifications" ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "Recipients mark notifications read" ON public.notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "Admins read notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX order_events_order_created_idx ON public.order_events(order_id, created_at DESC);
CREATE INDEX order_visualizations_order_idx ON public.order_visualizations(order_id, version DESC);
CREATE INDEX visualization_images_visualization_idx ON public.visualization_images(visualization_id, sort_order);
CREATE INDEX revision_requests_order_idx ON public.revision_requests(order_id, created_at DESC);
CREATE INDEX order_files_order_idx ON public.order_files(order_id, created_at DESC);
CREATE INDEX notifications_recipient_idx ON public.notifications(recipient_id, read_at, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_events(order_id, actor_id, event_type, title, details)
    VALUES (NEW.id, auth.uid(), 'status_changed', 'Status zmieniony na: ' || NEW.status, 'Poprzedni status: ' || OLD.status);
    INSERT INTO public.notifications(recipient_id, order_id, title, message)
    VALUES (NEW.user_id, NEW.id, 'Nowy etap zamówienia', 'Status zamówienia ' || NEW.order_number || ' zmienił się na: ' || NEW.status || '.');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER orders_status_history AFTER UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

CREATE OR REPLACE FUNCTION public.accept_order_visualization(_visualization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_order public.orders%ROWTYPE; v_visual public.order_visualizations%ROWTYPE;
BEGIN
  SELECT * INTO v_visual FROM public.order_visualizations WHERE id = _visualization_id FOR UPDATE;
  IF NOT FOUND OR v_visual.state <> 'awaiting_review' THEN RAISE EXCEPTION 'Ta wizualizacja nie oczekuje na akceptację'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = v_visual.order_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Brak dostępu'; END IF;
  UPDATE public.order_visualizations SET state = 'accepted', decided_at = now() WHERE id = _visualization_id;
  UPDATE public.order_visualizations SET state = 'superseded' WHERE order_id = v_order.id AND id <> _visualization_id AND state <> 'accepted';
  UPDATE public.orders SET status = 'Modelowanie' WHERE id = v_order.id;
  INSERT INTO public.order_events(order_id, actor_id, event_type, title) VALUES (v_order.id, auth.uid(), 'visualization_accepted', 'Wizualizacja v' || v_visual.version || ' została zaakceptowana');
  INSERT INTO public.notifications(recipient_id, order_id, title, message, email_pending)
    SELECT ur.user_id, v_order.id, 'Klient zaakceptował wizualizację', 'Zamówienie ' || v_order.order_number || ' może przejść do modelowania.', true FROM public.user_roles ur WHERE ur.role = 'admin';
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_order_visualization(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_order_revision(_visualization_id uuid, _message text, _attachment_path text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_order public.orders%ROWTYPE; v_visual public.order_visualizations%ROWTYPE; v_round integer; v_status text;
BEGIN
  IF length(trim(_message)) < 3 OR length(_message) > 1000 THEN RAISE EXCEPTION 'Opis zmian musi mieć od 3 do 1000 znaków'; END IF;
  SELECT * INTO v_visual FROM public.order_visualizations WHERE id = _visualization_id FOR UPDATE;
  IF NOT FOUND OR v_visual.state <> 'awaiting_review' THEN RAISE EXCEPTION 'Ta wizualizacja nie oczekuje na poprawki'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = v_visual.order_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Brak dostępu'; END IF;
  v_round := v_order.revision_rounds_used + 1;
  IF v_round > 2 AND NOT v_order.paid_revision_unlocked THEN v_status := 'awaiting_payment'; ELSE v_status := 'submitted'; END IF;
  INSERT INTO public.revision_requests(order_id, visualization_id, user_id, message, round_number, is_paid, status, attachment_path)
  VALUES (v_order.id, _visualization_id, auth.uid(), trim(_message), v_round, v_round > 2, v_status, _attachment_path);
  IF v_status = 'submitted' THEN
    UPDATE public.orders SET revision_rounds_used = v_round, paid_revision_unlocked = false, status = 'Poprawki' WHERE id = v_order.id;
    UPDATE public.order_visualizations SET state = 'changes_requested', decided_at = now() WHERE id = _visualization_id;
  END IF;
  INSERT INTO public.order_events(order_id, actor_id, event_type, title, details)
  VALUES (v_order.id, auth.uid(), CASE WHEN v_status = 'submitted' THEN 'revision_requested' ELSE 'paid_revision_requested' END,
    CASE WHEN v_status = 'submitted' THEN 'Klient zgłosił poprawki do wizualizacji v' || v_visual.version ELSE 'Klient zamówił dodatkową rundę poprawek' END, trim(_message));
  INSERT INTO public.notifications(recipient_id, order_id, title, message, email_pending)
    SELECT ur.user_id, v_order.id, CASE WHEN v_status = 'submitted' THEN 'Nowe poprawki klienta' ELSE 'Prośba o płatną rundę poprawek' END,
      'Zamówienie ' || v_order.order_number || ' wymaga działania.', true FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN v_status;
END;
$$;
GRANT EXECUTE ON FUNCTION public.request_order_revision(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.publish_order_visualization(_visualization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_order public.orders%ROWTYPE; v_visual public.order_visualizations%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Brak dostępu'; END IF;
  SELECT * INTO v_visual FROM public.order_visualizations WHERE id = _visualization_id FOR UPDATE;
  IF NOT FOUND OR v_visual.state <> 'draft' THEN RAISE EXCEPTION 'Wizualizacja nie jest szkicem'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.visualization_images WHERE visualization_id = _visualization_id) THEN RAISE EXCEPTION 'Dodaj przynajmniej jedno ujęcie'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = v_visual.order_id FOR UPDATE;
  UPDATE public.order_visualizations SET state = 'superseded' WHERE order_id = v_order.id AND id <> _visualization_id AND state = 'awaiting_review';
  UPDATE public.order_visualizations SET state = 'awaiting_review', sent_at = now() WHERE id = _visualization_id;
  UPDATE public.orders SET status = 'Wizualizacja' WHERE id = v_order.id;
  INSERT INTO public.order_events(order_id, actor_id, event_type, title) VALUES (v_order.id, auth.uid(), 'visualization_published', 'Wizualizacja v' || v_visual.version || ' została dodana');
  INSERT INTO public.notifications(recipient_id, order_id, title, message) VALUES (v_order.user_id, v_order.id, 'Wizualizacja jest gotowa', 'Nowa wersja wizualizacji zamówienia ' || v_order.order_number || ' czeka na Twoją decyzję.');
END;
$$;
GRANT EXECUTE ON FUNCTION public.publish_order_visualization(uuid) TO authenticated;

CREATE POLICY "Order owners read stored files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'order-files' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = (storage.foldername(name))[1] AND o.user_id = auth.uid()));
CREATE POLICY "Admins read stored files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners upload revision files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'order-files' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = (storage.foldername(name))[1] AND o.user_id = auth.uid()));
CREATE POLICY "Admins upload order files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update order files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete order files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));