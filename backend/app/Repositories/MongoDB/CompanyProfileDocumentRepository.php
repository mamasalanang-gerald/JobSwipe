<?php

namespace App\Repositories\MongoDB;

use App\Models\MongoDB\CompanyProfileDocument;

class CompanyProfileDocumentRepository
{
    public function findByUserId(string $userId): ?CompanyProfileDocument
    {
        return CompanyProfileDocument::where('user_id', $userId)->first();
    }

    public function findByCompanyId(string $companyId): ?CompanyProfileDocument
    {
        return CompanyProfileDocument::where('company_id', $companyId)->first();
    }

    public function create(array $data): CompanyProfileDocument
    {
        return CompanyProfileDocument::create($data);
    }

    public function update(CompanyProfileDocument $profile, array $data): CompanyProfileDocument
    {
        $profile->update($data);

        return $profile->fresh();
    }

    public function updateFields(string $companyId, array $fields): void
    {
        CompanyProfileDocument::where('company_id', $companyId)->update($fields);
    }

    public function addOfficeImage(string $companyId, string $imageUrl): ?CompanyProfileDocument
    {
        $profile = $this->findByCompanyId($companyId);

        if (! $profile) {
            return null;
        }

        $images = $profile->office_images ?? [];
        $images[] = $imageUrl;

        $profile->update(['office_images' => array_values($images)]);

        return $profile->fresh();
    }

    public function removeOfficeImage(string $companyId, int|string $indexOrUrl): ?CompanyProfileDocument
    {
        $profile = $this->findByCompanyId($companyId);

        if (! $profile) {
            return null;
        }

        $images = $profile->office_images ?? [];

        if (is_int($indexOrUrl) || ctype_digit((string) $indexOrUrl)) {
            $index = (int) $indexOrUrl;
            if (array_key_exists($index, $images)) {
                unset($images[$index]);
            }
        } else {
            $images = array_filter(
                $images,
                static fn ($image): bool => $image !== $indexOrUrl
            );
        }

        $profile->update(['office_images' => array_values($images)]);

        return $profile->fresh();
    }

    public function getNotificationPreferences(string $companyId): ?array
    {
        $profile = $this->findByCompanyId($companyId);

        return $profile ? $profile->getNotificationPreferences() : null;
    }

    public function updateNotificationPreferences(string $companyId, array $preferences): void
    {
        $profile = $this->findByCompanyId($companyId);

        if ($profile) {
            $currentPrefs = $profile->getNotificationPreferences();
            $merged = array_merge($currentPrefs, $preferences);
            $profile->update(['notification_preferences' => $merged]);
        }
    }
}
