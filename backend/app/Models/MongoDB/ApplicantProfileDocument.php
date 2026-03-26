<?php

namespace App\Models\MongoDB;

use MongoDB\Laravel\Eloquent\Model;

class ApplicantProfileDocument extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'applicant_profiles';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'profile_photo_url',
        'bio',
        'location',
        'location_city',
        'location_region',
        'linkedin_url',
        'social_links',
        'resume_url',
        'cover_letter_url',
        'portfolio_url',
        'skills',
        'work_experience',
        'education',
        'completed_profile_fields',
        'notification_preferences',
    ];

    protected $casts = [
        'skills' => 'array',
        'work_experience' => 'array',
        'education' => 'array',
        'social_links' => 'array',
        'completed_profile_fields' => 'array',
        'notification_preferences' => 'array',
    ];

    /**
     * Get default notification preferences
     */
    public function getDefaultNotificationPreferences(): array
    {
        return [
            'email_enabled' => true,
            'push_enabled' => true,
            'channels' => [
                'interview_invitation' => ['email' => true, 'push' => true],
                'match_found' => ['email' => true, 'push' => true],
                'profile_tips' => ['email' => false, 'push' => false],
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
