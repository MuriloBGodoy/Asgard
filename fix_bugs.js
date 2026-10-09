const fs = require('fs');
let c = fs.readFileSync('apps/desktop/src/components/VoiceRoom.tsx', 'utf8');

const hookRegex = /const \[noiseFilterEnabled[\s\S]*?\}, \[\]\);/;
const hookMatch = c.match(hookRegex);

if (hookMatch) {
    const hookCode = hookMatch[0];
    c = c.replace(hookCode, ''); // Remove hook from where it is
    
    // Find the early return for error
    const insertPoint = c.indexOf('if (error) {');
    
    // Insert hook before the error return
    c = c.substring(0, insertPoint) + hookCode + '\n\n  ' + c.substring(insertPoint);
    
    fs.writeFileSync('apps/desktop/src/components/VoiceRoom.tsx', c, 'utf8');
    console.log('Fixed VoiceRoom.tsx hooks');
}

// NOW FIX ACCENTS IN ALL FILES
const dir = 'apps/desktop/src/components/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = {
    'Invisvel': 'Invisível',
    'usurio': 'usuário',
    'no': 'não',
    'Configuraes': 'Configurações',
    'Configuraes': 'Configurações',
    'AparǦncia': 'Aparência',
    'Notificaes': 'Notificações',
    'Sada': 'Saída',
    'Padrǜo': 'Padrão',
    'estǭ': 'está',
    'ficarǭ': 'ficará',
    'atualizaes': 'atualizações',
    'vocǦ': 'você',
    'Informaes': 'Informações',
    '?udio': 'Áudio',
    '?cones': 'Ícones',
    'InvisÃ­vel': 'Invisível',
    'usuÃ¡rio': 'usuário',
    'nÃ£o': 'não',
    'ConfiguraÃ§Ãµes': 'Configurações',
    'AparÃªncia': 'Aparência',
    'NotificaÃ§Ãµes': 'Notificações',
    'SaÃ­da': 'Saída',
    'PadrÃ£o': 'Padrão',
    'estÃ¡': 'está',
    'ficarÃ¡': 'ficará',
    'atualizaÃ§Ãµes': 'atualizações',
    'vocÃª': 'você',
    'InformaÃ§Ãµes': 'Informações',
    'Ã udio': 'Áudio',
    'Ã cones': 'Ícones',
    'DisponÃ­vel': 'Disponível',
    'Disponvel': 'Disponível',
    'usuǭrio nǜo': 'usuário não',
};

for (const file of files) {
    let content = fs.readFileSync(dir + file, 'utf8');
    let changed = false;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(dir + file, content, 'utf8');
        console.log('Fixed accents in ' + file);
    }
}
