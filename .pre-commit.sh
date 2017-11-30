git diff --name-only HEAD | grep ".*\.js" | xargs ./node_modules/.bin/eslint
