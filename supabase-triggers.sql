-- ============================================
-- TRIGGER : Mise à jour automatique de student_statistics
-- ============================================
-- Ce trigger recalcule les statistiques d'un élève
-- chaque fois qu'un trade, account, cost ou payout est modifié
-- ============================================

-- 1) Fonction pour recalculer les stats d'un élève
CREATE OR REPLACE FUNCTION update_student_statistics(p_user_id UUID)
RETURNS void AS $$
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

    RAISE NOTICE 'Stats mises à jour pour user_id: %', p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 2) Trigger sur la table TRADES
CREATE OR REPLACE FUNCTION trigger_update_student_stats_from_trades()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les stats du user concerné
    IF TG_OP = 'DELETE' THEN
        PERFORM update_student_statistics(OLD.user_id);
    ELSE
        PERFORM update_student_statistics(NEW.user_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trades_update_stats ON trades;
CREATE TRIGGER trades_update_stats
AFTER INSERT OR UPDATE OR DELETE ON trades
FOR EACH ROW
EXECUTE FUNCTION trigger_update_student_stats_from_trades();

-- 3) Trigger sur la table ACCOUNTS
CREATE OR REPLACE FUNCTION trigger_update_student_stats_from_accounts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_student_statistics(OLD.user_id);
    ELSE
        PERFORM update_student_statistics(NEW.user_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accounts_update_stats ON accounts;
CREATE TRIGGER accounts_update_stats
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW
EXECUTE FUNCTION trigger_update_student_stats_from_accounts();

-- 4) Trigger sur la table ACCOUNT_COSTS
CREATE OR REPLACE FUNCTION trigger_update_student_stats_from_costs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_student_statistics(OLD.user_uuid);
    ELSE
        PERFORM update_student_statistics(NEW.user_uuid);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS costs_update_stats ON account_costs;
CREATE TRIGGER costs_update_stats
AFTER INSERT OR UPDATE OR DELETE ON account_costs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_student_stats_from_costs();

-- 5) Trigger sur la table PAYOUTS
CREATE OR REPLACE FUNCTION trigger_update_student_stats_from_payouts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_student_statistics(OLD.user_uuid);
    ELSE
        PERFORM update_student_statistics(NEW.user_uuid);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payouts_update_stats ON payouts;
CREATE TRIGGER payouts_update_stats
AFTER INSERT OR UPDATE OR DELETE ON payouts
FOR EACH ROW
EXECUTE FUNCTION trigger_update_student_stats_from_payouts();

-- ============================================
-- SCRIPT DE RECALCUL INITIAL
-- ============================================
-- Recalculer les stats de TOUS les élèves actifs
DO $$
DECLARE
    student_record RECORD;
BEGIN
    FOR student_record IN 
        SELECT uuid FROM users WHERE role = 'student'
    LOOP
        PERFORM update_student_statistics(student_record.uuid);
        RAISE NOTICE 'Stats recalculées pour: %', student_record.uuid;
    END LOOP;
END;
$$;

-- Afficher le résultat
SELECT 
    email,
    total_accounts,
    total_trades,
    total_pnl,
    avg_pnl,
    winning_trades
FROM student_statistics
ORDER BY total_trades DESC;
