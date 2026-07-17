#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Running BudgetControl Test Suite ==="

# Force test database configuration and run Jest
export TURSO_DATABASE_URL="file:test.db"

echo "Executing Jest tests sequentially..."
npx jest --runInBand

echo "=== All Tests Passed Successfully ==="
