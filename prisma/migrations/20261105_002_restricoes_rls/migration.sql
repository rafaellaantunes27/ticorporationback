-- Ajuste aditivo de segurança para o PostgreSQL/Supabase.
-- IMPORTANTE: avaliar em banco de testes isolado; NÃO aplicado nesta entrega.
-- O Prisma do backend deve operar via papel SQL restrito e autorizado ao modelo de acesso da API.
-- A API aplica ainda autorização por token Supabase em todos os endpoints /api/.

DROP POLICY IF EXISTS "users_select_own_profile" ON public."users";
DROP POLICY IF EXISTS "equipment_select_all" ON public."equipment";
DROP POLICY IF EXISTS "loans_select_all" ON public."loans";
DROP POLICY IF EXISTS "users_modify_for_operations" ON public."users";
DROP POLICY IF EXISTS "equipment_modify_for_operations" ON public."equipment";
DROP POLICY IF EXISTS "loans_modify_for_operations" ON public."loans";

-- Clientes REST do Supabase não podem consultar esses dados como anônimos.
-- O frontend usa exclusivamente a API Nest para operações de negócio.
CREATE POLICY "users_read_self" ON public."users"
  FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE POLICY "equipment_read_authenticated" ON public."equipment"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "loans_read_self" ON public."loans"
  FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT id FROM public."users"
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));

-- Nenhuma política para INSERT/UPDATE/DELETE é oferecida ao navegador.
-- Escritas passam pelo backend autenticado. Não expor sua conexão SQL.
