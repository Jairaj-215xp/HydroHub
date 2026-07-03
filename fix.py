import sys

with open('info.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'pâ º': 'p&#8314;',
    'Â¹H': '&#185;H',
    'Â²H': '&#178;H',
    'Â³H': '&#179;H',
    'Hâ‚‚': 'H&#8322;',
    'Oâ‚‚': 'O&#8322;',
    'CHâ‚„': 'CH&#8324;',
    'COâ‚‚': 'CO&#8322;',
    'Â°C': '&#176;C',
    'âš™ï¸ ': '&#9881;',
    'ðŸ’§': '&#128167;',
    'ðŸš¢': '&#128674;',
    'ðŸ ­': '&#127981;',
    'ðŸš›': '&#128666;',
    'âš¡': '&#9889;',
    'â˜ ï¸ ': '&#128168;',
    'â†‘': '&#8593;'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('info.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully fixed info.html encoding')
