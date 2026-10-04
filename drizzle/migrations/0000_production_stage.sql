CREATE OR REPLACE FUNCTION public.accept_order_visualization(_visualization_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_order public.orders%ROWTYPE; v_visual public.order_visualizations%ROWTYPE;
BEGIN
  SELECT * INTO v_visual FROM public.order_visualizations WHERE id = _visualization_id FOR UPDATE;
  IF NOT FOUND OR v_visual.state <> 'awaiting_review' THEN RAISE EXCEPTION 'Ta wizualizacja nie oczekuje na akceptację'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = v_visual.order_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Brak dostępu'; END IF;
  UPDATE public.order_visualizations SET state = 'accepted', decided_at = now() WHERE id = _visualization_id;
  UPDATE public.order_visualizations SET state = 'superseded' WHERE order_id = v_order.id AND id <> _visualization_id AND state <> 'accepted';
  UPDATE public.orders SET status = 'Produkcja' WHERE id = v_order.id;
  INSERT INTO public.order_events(order_id, actor_id, event_type, title) VALUES (v_order.id, auth.uid(), 'visualization_accepted', 'Wizualizacja v' || v_visual.version || ' została zaakceptowana');
  INSERT INTO public.notifications(recipient_id, order_id, title, message, email_pending)
    SELECT ur.user_id, v_order.id, 'Klient zaakceptował wizualizację', 'Zamówienie ' || v_order.order_number || ' może przejść do produkcji.', true FROM public.user_roles ur WHERE ur.role = 'admin';
END;
$function$;
UPDATE public.orders SET status = 'Produkcja' WHERE status IN ('Modelowanie','Druk','Malowanie');