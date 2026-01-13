-- ============================================
-- ÉTAPE 3 : Recalculer les stats pour TOUS les élèves
-- ============================================

DO $block$
DECLARE
    student_record RECORD;
BEGIN
    FOR student_record IN 
        SELECT uuid, email FROM users WHERE role = 'student'
    LOOP
        PERFORM update_student_statistics(student_record.uuid);
        RAISE NOTICE 'Stats recalculées pour: % (%)', student_record.email, student_record.uuid;
    END LOOP;
END;
$block$;

-- Afficher le résultat pour TOUS les élèves
SELECT 
    email,
    total_accounts,
    total_trades,
    total_pnl,
    avg_pnl,
    winning_trades,
    updated_at
FROM student_statistics
ORDER BY total_trades DESC;
