#!/bin/bash
# Lire le base64 complet
LOGO_BASE64=$(cat trader360-logo-base64.txt)

# Créer un fichier temporaire avec le nouveau code
cat > temp-logo-section.txt << ENDCODE
        // 6. Logo Trader360 en haut
        const topLogoImg = new Image();
        await new Promise((resolve) => {
            topLogoImg.onload = () => {
                // Dessiner le logo centré en haut (150x150)
                const topLogoSize = 150;
                ctx.drawImage(topLogoImg, (1080 - topLogoSize) / 2, 30, topLogoSize, topLogoSize);
                resolve();
            };
            topLogoImg.onerror = () => {
                console.warn('[SHARE] ⚠️ Logo Trader360 non chargé');
                resolve();
            };
            topLogoImg.src = 'data:image/png;base64,${LOGO_BASE64}';
        });
ENDCODE

echo "Fichier temporaire créé"
