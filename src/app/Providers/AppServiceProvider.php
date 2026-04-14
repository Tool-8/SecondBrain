<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\NoteRepository;
use App\Repositories\NoteRepositoryInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(NoteRepositoryInterface::class, NoteRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
