#!/bin/bash

echo "Checking production PostgreSQL tables..."
docker run -it --rm postgres:15-alpine psql postgresql://jobswipe_acb5_user:vpklnROXCJvTWxPbM5SjCnYVKiKci9Bz@dpg-d6v3477gi27c73eoinpg-a.oregon-postgres.render.com:5432/jobswipe_acb5 -c "\dt"
