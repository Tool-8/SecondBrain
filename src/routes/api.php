<?php

    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\Api\ExportController;
    use App\Http\Controllers\Api\NoteController;

    Route::apiResource('notes', NoteController::class);
    
    Route::get('notes/{id}/export', ExportController::class);
?>
