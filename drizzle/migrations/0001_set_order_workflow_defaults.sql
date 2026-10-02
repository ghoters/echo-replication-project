ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Opłacone';

CREATE OR REPLACE FUNCTION public.log_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.order_events(order_id, actor_id, event_type, title)
  VALUES (NEW.id, NEW.user_id, 'order_paid', 'Zamówienie opłacone');
  RETURN NEW;
END;
$$;
CREATE TRIGGER orders_initial_history AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_new_order();