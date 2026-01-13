-- PARTIE 2 : Vérifier le résultat
SELECT 
    email,
    total_accounts,
    total_trades,
    total_pnl,
    avg_pnl,
    winning_trades,
    updated_at
FROM student_statistics
WHERE email = 'duez.cloe@hotmail.fr';
