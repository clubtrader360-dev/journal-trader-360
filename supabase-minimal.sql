-- PARTIE 1 : Mettre à jour les stats de Chloé (version minimale)
WITH compte_data AS (
    SELECT COUNT(*) as nb_comptes
    FROM accounts
    WHERE user_id = '0d9561c8-d909-4de2-802c-616a3397a499'
),
trade_data AS (
    SELECT 
        COUNT(*) as nb_trades,
        COALESCE(SUM(pnl), 0) as total_pnl,
        COALESCE(AVG(pnl), 0) as avg_pnl,
        COUNT(*) FILTER (WHERE pnl > 0) as winning_trades
    FROM trades
    WHERE user_id = '0d9561c8-d909-4de2-802c-616a3397a499'
)
INSERT INTO student_statistics (
    user_id,
    email,
    total_accounts,
    total_trades,
    total_pnl,
    avg_pnl,
    winning_trades
)
SELECT 
    '0d9561c8-d909-4de2-802c-616a3397a499'::uuid,
    'duez.cloe@hotmail.fr',
    compte_data.nb_comptes,
    trade_data.nb_trades,
    trade_data.total_pnl,
    trade_data.avg_pnl,
    trade_data.winning_trades
FROM compte_data, trade_data
ON CONFLICT (user_id) 
DO UPDATE SET
    email = EXCLUDED.email,
    total_accounts = EXCLUDED.total_accounts,
    total_trades = EXCLUDED.total_trades,
    total_pnl = EXCLUDED.total_pnl,
    avg_pnl = EXCLUDED.avg_pnl,
    winning_trades = EXCLUDED.winning_trades;
