#!/bin/sh
# Rejoue toutes les migrations, dans l'ordre, sur une base Postgres vide
# (avec l'imitation de Supabase), puis affiche l'empreinte de la base.
# Usage : PGHOST=... PGUSER=... sh supabase/tests/rejouer.sh
set -e
cd "$(dirname "$0")/../.."
psql -v ON_ERROR_STOP=1 -q -c "drop database if exists nebula_essai;" -c "create database nebula_essai;"
psql -v ON_ERROR_STOP=1 -q -d nebula_essai -f supabase/tests/imitation-supabase.sql
for f in supabase/migrations/*.sql; do
    echo "migration $f"
    psql -v ON_ERROR_STOP=1 -q -d nebula_essai -f "$f" > /dev/null
done
echo "--- empreinte ---"
psql -At -F' ' -d nebula_essai -f supabase/signature.sql
