-- ============================================
-- ÉTAPE 1 : Créer la fonction de mise à jour
-- ============================================
CREATE OR REPLACE FUNCTION update_student_statistics(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    v_total_accounts INT;
    v_total_trades INT;
    v_total_pnl NUMERIC;
    v_avg_pnl NUMERIC;
    v_winning_trades INT;
    v_total_costs NUMERIC;
    v_total_payouts NUMERIC;
BEGIN
    -- Compter les comptes
    SELECT COUNT(*) INTO v_total_accounts
    FROM accounts
    WHERE user_id = p_user_id;

    -- Compter les trades et calculer le P&L
    SELECT 
        COUNT(*),
        COALESCE(SUM(pnl), 0),
        COALESCE(AVG(pnl), 0),
        COUNT(*) FILTER (WHERE pnl > 0)
    INTO v_total_trades, v_total_pnl, v_avg_pnl, v_winning_trades
    FROM trades
    WHERE user_id = p_user_id;

    -- Calculer les coûts totaux
    SELECT COALESCE(SUM(amount), 0) INTO v_total_costs
    FROM account_costs
    WHERE user_uuid = p_user_id;

    -- Calculer les payouts totaux
    SELECT COALESCE(SUM(amount), 0) INTO v_total_payouts
    FROM payouts
    WHERE user_uuid = p_user_id;

    -- Mettre à jour ou insérer les statistiques
    INSERT INTO student_statistics (
        user_id,
        email,
        total_accounts,
        total_trades,
        total_pnl,
        avg_pnl,
        winning_trades,
        total_costs,
        total_payouts,
        updated_at
    )
    VALUES (
        p_user_id,
        (SELECT email FROM users WHERE uuid = p_user_id),
        v_total_accounts,
        v_total_trades,
        v_total_pnl,
        v_avg_pnl,
        v_winning_trades,
        v_total_costs,
        v_total_payouts,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        total_accounts = EXCLUDED.total_accounts,
        total_trades = EXCLUDED.total_trades,
        total_pnl = EXCLUDED.total_pnl,
        avg_pnl = EXCLUDED.avg_pnl,
        winning_trades = EXCLUDED.winning_trades,
        total_costs = EXCLUDED.total_costs,
        total_payouts = EXCLUDED.total_payouts,
        updated_at = NOW();
END;
$function$;
