<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SetupStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-structure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup app folder structure';

    public function handle()
    {
        $folders = [
            app_path('Exceptions'),
            app_path('Http/Controllers'),
            app_path('Http/Middlewares'),
            app_path('Http/Requests'),
            app_path('Models/PostgreSQL'),
            app_path('Models/MongoDB'),
            app_path('Repositories'),
            app_path('Jobs'),
        ];

        foreach ($folders as $folder) {
            if (! File::exists($folder)) {
                File::makeDirectory($folder, 0755, true);
                $this->info("Created: {$folder}");
            } else {
                $this->line("Already exists: {$folder}");
            }
        }

        return Command::SUCCESS;
    }
}
