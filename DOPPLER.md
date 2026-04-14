# Doppler — commandes utiles

```bash
# === CONFIG DU DOSSIER (quelle config Doppler est utilisée ici ?) ===
doppler configure                          # voir la config scopée au dossier courant
doppler configure --all                    # voir tous les mappings dossier → project/config
doppler setup                              # (ré)associer le dossier à un project/config (interactif)
doppler configure unset project config     # retirer l'association du dossier

# === EXPLORER LE PROJET ===
doppler projects                           # lister tous les projects
doppler configs --project adatools         # lister les configs (dev, stg, prd, ...) d'un project
doppler activity                           # historique des modifs (qui a changé quoi, quand)

# === LIRE LES SECRETS ===
doppler secrets                            # lister les secrets de la config courante (masqués)
doppler secrets --only-names               # juste les noms
doppler secrets get GITHUB_CLIENT_SECRET   # voir une valeur (formatée)
doppler secrets get GITHUB_CLIENT_SECRET --plain  # valeur brute (pour pipe/var shell)
doppler secrets download --no-file --format env   # dump au format .env (stdout)
doppler secrets download --no-file --format env > .env.doppler  # dump vers fichier

# === AJOUTER / REMPLACER UN SECRET ===
doppler secrets set KEY="valeur"                   # create ou update
doppler secrets set KEY="valeur" --silent          # sans afficher la valeur en retour
doppler secrets set K1="v1" K2="v2"                # plusieurs d'un coup
echo "valeur" | doppler secrets set KEY            # via stdin (plus safe, pas dans ps/history)

# === SUPPRIMER UN SECRET ===
doppler secrets delete KEY                 # demande confirmation
doppler secrets delete KEY --yes           # sans confirmation

# === CIBLER UNE AUTRE CONFIG QUE CELLE DU DOSSIER ===
doppler secrets get KEY --config prd                   # lire depuis prd
doppler secrets set KEY="v" --config prd               # écrire sur prd
doppler secrets set KEY="v" --project adatools --config prd  # full qualifié

# === INJECTER LES SECRETS DANS UNE COMMANDE ===
doppler run -- pnpm dev                    # lance avec les vars injectées
doppler run -- pnpm prisma migrate dev
doppler run --config prd -- pnpm build     # injecter depuis une autre config

# === COMPARER LOCAL .env vs DOPPLER ===
diff <(sort .env) <(doppler secrets download --no-file --format env | sort)

# === AUTH / TOKEN ===
doppler login                              # se connecter (interactif, ouvre le navigateur)
doppler logout
doppler me                                 # qui suis-je ?
```
