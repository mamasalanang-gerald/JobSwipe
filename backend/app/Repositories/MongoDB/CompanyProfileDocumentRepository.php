<?php

namespace App\Repositories\MongoDB;

use App\Models\MongoDB\CompanyProfileDocument;

class CompanyProfileDocumentRepository
{
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
