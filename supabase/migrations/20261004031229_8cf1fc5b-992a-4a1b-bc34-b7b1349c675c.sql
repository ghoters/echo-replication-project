revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.log_order_status_change() from public, anon, authenticated;
revoke execute on function public.accept_order_visualization(uuid) from public, anon;
revoke execute on function public.publish_order_visualization(uuid) from public, anon;
revoke execute on function public.request_order_revision(uuid, text, text) from public, anon;