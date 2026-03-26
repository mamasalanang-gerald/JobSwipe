<?php

namespace App\Models\MongoDB;

use MongoDB\Laravel\Eloquent\Model;

class CompanyProfileDocument extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'company_profiles';

    protected $fillable = [
        'company_id',
        'company_name',
        'tagline',
        'description',
        'industry',
        'company_size',
        'founded_year',
        'website_url',
        'logo_url',
        'office_images',
        'social_links',
        'address',
        'benefits',
        'culture_tags',
        'notification_preferences',
    ];

    protected $casts = [
        'office_images' => 'array',
        'social_links' => 'array',
        'address' => 'array',
        'benefits' => 'array',
        'culture_tags' => 'array',
        'founded_year' => 'integer',
        'notification_preferences' => 'array',
    ];

    /**
     * Get default notification preferences for company/HR users
     */
    public function getDefaultNotificationPreferences(): array
    {
        return [
            'email_enabled' => true,
            'push_enabled' => true,
            'channels' => [
                'new_application' => ['email' => true, 'push' => true],
                'applicant_response' => ['email' => true, 'push' => true],
                'job_expiring_soon' => ['email' => true, 'push' => false],
            ],
        ];
    }

    /**
     * Get notification preferences with defaults
     */
    public function getNotificationPreferences(): array
    {
        return $this->notification_preferences ?? $this->getDefaultNotificationPreferences();
    }
}
