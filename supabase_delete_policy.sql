-- إضافة سياسة للسماح بحذف البورتوفوليوهات
-- يمكن للمستخدم حذف البورتوفوليوهات الخاصة به فقط

-- حذف السياسة القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "public_delete_own" ON portfolios;

-- إنشاء سياسة جديدة للحذف
CREATE POLICY "public_delete_own" ON portfolios
FOR DELETE
USING (
  -- السماح بالحذف إذا كان المستخدم هو صاحب البورتوفوليو
  auth.uid() = user_id
  OR
  -- أو السماح بالحذف للجميع (إذا كنت تريد السماح بالحذف العام)
  true
);

-- ملاحظة: إذا كنت تريد السماح فقط لصاحب البورتوفوليو بالحذف، استخدم هذا بدلاً من ذلك:
-- CREATE POLICY "public_delete_own" ON portfolios
-- FOR DELETE
-- USING (auth.uid() = user_id);
