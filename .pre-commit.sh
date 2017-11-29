git diff --name-only HEAD | grep ".*\.js" | xargs prettier --write
