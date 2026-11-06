-- Executar apenas manualmente, após revisão e em ambiente de destino aprovado.
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photo_source_url TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photo_author TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photo_id TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photo_license TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS equipment_photo_id_key ON public.equipment(photo_id);
-- Não permite anexar a mesma foto a dois patrimônios.
