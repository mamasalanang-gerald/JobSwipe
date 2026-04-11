<?php

namespace Tests\Unit\Repositories;

use App\Models\MongoDB\CompanyProfileDocument;
use App\Repositories\MongoDB\CompanyProfileDocumentRepository;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class CompanyProfileDocumentRepositoryUnitTest extends TestCase
{
    public function test_repository_exposes_crud_methods_with_expected_query_keys(): void
    {
        $source = file_get_contents(base_path('app/Repositories/MongoDB/CompanyProfileDocumentRepository.php'));

        $this->assertStringContainsString('function findByUserId(string $userId)', $source);
        $this->assertStringContainsString("where('user_id'", $source);
        $this->assertStringContainsString('function findByCompanyId(string $companyId)', $source);
        $this->assertStringContainsString("where('company_id'", $source);
        $this->assertStringContainsString('function create(array $data)', $source);
        $this->assertStringContainsString('function update(CompanyProfileDocument $profile, array $data)', $source);
    }

    public function test_update_returns_fresh_model_after_update_call(): void
    {
        $repository = new CompanyProfileDocumentRepository;

        /** @var CompanyProfileDocument&MockObject $profile */
        $profile = $this->getMockBuilder(CompanyProfileDocument::class)
            ->onlyMethods(['update', 'fresh'])
            ->getMock();

        $profile->expects($this->once())
            ->method('update')
            ->with(['company_name' => 'JobSwipe Inc']);

        $profile->expects($this->once())
            ->method('fresh')
            ->willReturn($profile);

        $result = $repository->update($profile, ['company_name' => 'JobSwipe Inc']);

        $this->assertSame($profile, $result);
    }

    public function test_add_office_image_appends_new_url(): void
    {
        $profile = $this->makeInMemoryDocument(['a.jpg', 'b.jpg']);

        /** @var CompanyProfileDocumentRepository&MockObject $repository */
        $repository = $this->getMockBuilder(CompanyProfileDocumentRepository::class)
            ->onlyMethods(['findByCompanyId'])
            ->getMock();

        $repository->method('findByCompanyId')->willReturn($profile);

        $updated = $repository->addOfficeImage('company-1', 'c.jpg');

        $this->assertNotNull($updated);
        $this->assertSame(['a.jpg', 'b.jpg', 'c.jpg'], $updated->office_images);
    }

    public function test_remove_office_image_supports_index_and_url(): void
    {
        $profile = $this->makeInMemoryDocument(['a.jpg', 'b.jpg', 'c.jpg']);

        /** @var CompanyProfileDocumentRepository&MockObject $repository */
        $repository = $this->getMockBuilder(CompanyProfileDocumentRepository::class)
            ->onlyMethods(['findByCompanyId'])
            ->getMock();

        $repository->method('findByCompanyId')->willReturn($profile);

        $byIndex = $repository->removeOfficeImage('company-1', 1);
        $this->assertNotNull($byIndex);
        $this->assertSame(['a.jpg', 'c.jpg'], $byIndex->office_images);

        $byUrl = $repository->removeOfficeImage('company-1', 'a.jpg');
        $this->assertNotNull($byUrl);
        $this->assertSame(['c.jpg'], $byUrl->office_images);
    }

    public function test_update_notification_preferences_merges_existing_values(): void
    {
        $profile = $this->makeInMemoryDocument([]);
        $profile->notification_preferences = [
            'email_enabled' => true,
            'push_enabled' => true,
        ];

        /** @var CompanyProfileDocumentRepository&MockObject $repository */
        $repository = $this->getMockBuilder(CompanyProfileDocumentRepository::class)
            ->onlyMethods(['findByCompanyId'])
            ->getMock();

        $repository->method('findByCompanyId')->willReturn($profile);

        $repository->updateNotificationPreferences('company-1', [
            'push_enabled' => false,
            'weekly_digest' => true,
        ]);

        $this->assertSame(
            [
                'email_enabled' => true,
                'push_enabled' => false,
                'weekly_digest' => true,
            ],
            $profile->notification_preferences
        );
    }

    private function makeInMemoryDocument(array $officeImages): CompanyProfileDocument
    {
        /** @var CompanyProfileDocument&MockObject $profile */
        $profile = $this->getMockBuilder(CompanyProfileDocument::class)
            ->onlyMethods(['update', 'fresh'])
            ->getMock();

        $profile->office_images = $officeImages;

        $profile->method('update')
            ->willReturnCallback(function (array $attributes) use ($profile): bool {
                foreach ($attributes as $key => $value) {
                    $profile->{$key} = $value;
                }

                return true;
            });

        $profile->method('fresh')->willReturn($profile);

        return $profile;
    }
}
