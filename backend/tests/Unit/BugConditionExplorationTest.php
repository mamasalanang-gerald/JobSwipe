<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Bug Condition Exploration Test
 * 
 * This test is designed to FAIL on unfixed code to confirm the bug exists.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * Property 1: Bug Condition - PHPUnit Configuration and Database Seeder Availability
 * 
 * For any CI command where PHPUnit test execution or database seeding is invoked,
 * the system should locate the required configuration files (phpunit.xml.dist and
 * DatabaseSeeder.php) and execute the commands successfully without file-not-found
 * or class-not-found errors.
 */
class BugConditionExplorationTest extends TestCase
{
    /**
     * Test that phpunit.xml.dist configuration file exists
     * 
     * This test will FAIL on unfixed code because the file is missing.
     * When it passes after the fix, it confirms the bug is resolved.
     * 
     * @test
     */
    public function phpunit_configuration_file_exists(): void
    {
        $phpunitConfigPath = base_path('phpunit.xml.dist');
        
        $this->assertFileExists(
            $phpunitConfigPath,
            'PHPUnit configuration file (phpunit.xml.dist) must exist for CI tests to run. ' .
            'Expected location: ' . $phpunitConfigPath
        );
    }

    /**
     * Test that phpunit.xml.dist is valid XML
     * 
     * This test will FAIL on unfixed code because the file doesn't exist.
     * 
     * @test
     */
    public function phpunit_configuration_is_valid_xml(): void
    {
        $phpunitConfigPath = base_path('phpunit.xml.dist');
        
        $this->assertFileExists($phpunitConfigPath);
        
        $xmlContent = file_get_contents($phpunitConfigPath);
        $xml = @simplexml_load_string($xmlContent);
        
        $this->assertNotFalse(
            $xml,
            'PHPUnit configuration file must be valid XML'
        );
    }

    /**
     * Test that DatabaseSeeder class file exists
     * 
     * This test will FAIL on unfixed code because the file is missing.
     * 
     * @test
     */
    public function database_seeder_file_exists(): void
    {
        $seederPath = base_path('database/seeders/DatabaseSeeder.php');
        
        $this->assertFileExists(
            $seederPath,
            'DatabaseSeeder class file must exist for database seeding to work. ' .
            'Expected location: ' . $seederPath
        );
    }

    /**
     * Test that DatabaseSeeder class can be instantiated
     * 
     * This test will FAIL on unfixed code because the class doesn't exist.
     * 
     * @test
     */
    public function database_seeder_class_can_be_instantiated(): void
    {
        $this->assertTrue(
            class_exists('Database\\Seeders\\DatabaseSeeder'),
            'DatabaseSeeder class must exist in Database\\Seeders namespace'
        );
        
        $seeder = new \Database\Seeders\DatabaseSeeder();
        
        $this->assertInstanceOf(
            \Illuminate\Database\Seeder::class,
            $seeder,
            'DatabaseSeeder must extend Illuminate\\Database\\Seeder'
        );
    }

    /**
     * Test that database/seeders directory exists
     * 
     * This test will FAIL on unfixed code because the directory doesn't exist.
     * 
     * @test
     */
    public function database_seeders_directory_exists(): void
    {
        $seedersDir = base_path('database/seeders');
        
        $this->assertDirectoryExists(
            $seedersDir,
            'database/seeders directory must exist for Laravel autoloading. ' .
            'Expected location: ' . $seedersDir
        );
    }
}
