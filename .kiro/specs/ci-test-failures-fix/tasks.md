# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - PHPUnit Configuration and Database Seeder Availability
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test the concrete failing cases - `php artisan test --testsuite=Unit` without phpunit.xml.dist and `php artisan db:seed --force` without DatabaseSeeder class
  - Test that `php artisan test --testsuite=Unit` fails with "Could not read XML from file" error when phpunit.xml.dist is missing
  - Test that `php artisan db:seed --force` fails with "Target class [DatabaseSeeder] does not exist" error when DatabaseSeeder class is missing
  - Test that `backend/database/seeders/` directory may not exist
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Test CI Workflow Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (linting, migrations, Docker builds, security scans)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that `./vendor/bin/pint --test` continues to work (linting preservation)
  - Test that `php artisan migrate --force` continues to work (migration preservation)
  - Test that `php artisan test --testsuite=Feature` continues to work if feature tests exist (feature test preservation)
  - Test that Docker image builds successfully (Docker build preservation)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for CI test failures due to missing configuration files

  - [x] 3.1 Create phpunit.xml.dist configuration file
    - Create `backend/phpunit.xml.dist` file
    - Define Unit test suite pointing to `tests/Unit` directory
    - Define Feature test suite pointing to `tests/Feature` directory
    - Configure test environment variables (APP_ENV=testing, DB_CONNECTION=sqlite for in-memory testing)
    - Configure code coverage reporting to include `app/` directory
    - Set bootstrap path to `bootstrap/app.php`
    - _Bug_Condition: isBugCondition(input) where input.command == "php artisan test" AND NOT fileExists("backend/phpunit.xml.dist")_
    - _Expected_Behavior: PHPUnit locates configuration file and executes tests successfully without file-not-found errors_
    - _Preservation: Linting, migrations, Docker builds, and security scans continue to work exactly as before_
    - _Requirements: 2.1_

  - [x] 3.2 Create DatabaseSeeder class and directory structure
    - Create `backend/database/seeders/` directory if it doesn't exist
    - Create `backend/database/seeders/DatabaseSeeder.php` file
    - Use `Database\Seeders` namespace as expected by composer autoload
    - Extend `Illuminate\Database\Seeder` base class
    - Implement empty or minimal `run()` method that can be extended later
    - Add documentation comments explaining how to add seeders in the future
    - _Bug_Condition: isBugCondition(input) where input.command == "php artisan db:seed --force" AND NOT classExists("Database\\Seeders\\DatabaseSeeder")_
    - _Expected_Behavior: Database seeding command locates DatabaseSeeder class and executes without class-not-found errors_
    - _Preservation: Linting, migrations, Docker builds, and security scans continue to work exactly as before_
    - _Requirements: 2.2, 2.3_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - PHPUnit Configuration and Database Seeder Availability
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify `php artisan test --testsuite=Unit` now locates phpunit.xml.dist and runs successfully
    - Verify `php artisan db:seed --force` now locates DatabaseSeeder class and runs successfully
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Test CI Workflow Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify linting checks still work (`./vendor/bin/pint --test`)
    - Verify migrations still work (`php artisan migrate --force`)
    - Verify feature tests still work (`php artisan test --testsuite=Feature`)
    - Verify Docker builds still work
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
