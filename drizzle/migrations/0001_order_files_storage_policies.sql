CREATE POLICY "Admins manage order storage" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners read order storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'order-files' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = (storage.foldername(name))[1] AND o.user_id = auth.uid()));
CREATE POLICY "Owners upload revision refs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-files' AND (storage.foldername(name))[2] = 'revisions' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = (storage.foldername(name))[1] AND o.user_id = auth.uid()));