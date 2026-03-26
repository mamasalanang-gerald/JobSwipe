<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\Company\ApplicantReviewController;
use App\Http\Requests\Company\HRSwipeRequest;
use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\JobPosting;
use App\Models\PostgreSQL\JobSkill;
use App\Repositories\PostgreSQL\ApplicationRepository;
use App\Services\SwipeService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class HRApplicantReviewUnitTest extends TestCase
{
    public function test_hr_swipe_request_validation_rules_require_message(): void
    {
        $request = new HRSwipeRequest;
        $validator = validator([], $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    public function test_skill_match_calculation_accuracy(): void
    {
        $controller = $this->makeController();
        $method = (new ReflectionClass($controller))->getMethod('calculateSkillMatchPercentage');
        $method->setAccessible(true);

        $job = new JobPosting;
        $job->setRelation('skills', collect([
            new JobSkill(['skill_name' => 'PHP']),
            new JobSkill(['skill_name' => 'Laravel']),
            new JobSkill(['skill_name' => 'Redis']),
        ]));

        $profile = new ApplicantProfileDocument;
        $profile->skills = [
            ['name' => 'PHP'],
            ['name' => 'Redis'],
            ['name' => 'Docker'],
        ];

        $percentage = $method->invoke($controller, $job, $profile);

        $this->assertSame(67, $percentage);
    }

    public function test_incomplete_profile_detection(): void
    {
        $controller = $this->makeController();
        $method = (new ReflectionClass($controller))->getMethod('isApplicantProfileComplete');
        $method->setAccessible(true);

        $incomplete = new ApplicantProfileDocument;
        $incomplete->first_name = 'Jane';
        $incomplete->last_name = 'Doe';
        $incomplete->location = 'Makati';
        $incomplete->resume_url = null;
        $incomplete->skills = [];

        $complete = new ApplicantProfileDocument;
        $complete->first_name = 'Jane';
        $complete->last_name = 'Doe';
        $complete->location = 'Makati';
        $complete->resume_url = 'https://cdn.jobswipe.test/resume.pdf';
        $complete->skills = [['name' => 'PHP']];

        $this->assertFalse($method->invoke($controller, $incomplete));
        $this->assertTrue($method->invoke($controller, $complete));
    }

    private function makeController(): ApplicantReviewController
    {
        /** @var ApplicationRepository&MockObject $repo */
        $repo = $this->createMock(ApplicationRepository::class);
        /** @var SwipeService&MockObject $swipe */
        $swipe = $this->createMock(SwipeService::class);

        return new ApplicantReviewController($repo, $swipe);
    }
}
