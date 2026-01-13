-- ============================================
-- ÉTAPE 2 : Recalculer les stats pour Chloé uniquement
-- ============================================
-- UUID de Chloé : 0d9561c8-d909-4de2-802c-616a3397a499

SELECT update_student_statistics('0d9561c8-d909-4de2-802c-616a3397a499');

-- Vérifier le résultat
SELECT 
    email,
    total_accounts,
    total_trades,
    total_pnl,
    avg_pnl,
    winning_trades
FROM student_statistics
WHERE email = 'duez.cloe@hotmail.fr';
