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
    ];

    protected $casts = [
        'office_images' => 'array',
        'social_links' => 'array',
        'address' => 'array',
        'benefits' => 'array',
        'culture_tags' => 'array',
        'founded_year' => 'integer',
    ];
}
