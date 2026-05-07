<?php

    use App\Http\Controllers\Api\ImportController;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\Api\ExportController;
    use App\Http\Controllers\Api\LlmController;
    use App\Http\Controllers\Api\NoteController;

    Route::prefix('notes')->group(function () {
        Route::get('/', [NoteController::class, 'index']);      // lista
        Route::get('/{id}', [NoteController::class, 'show']);   // dettaglio
        Route::post('/', [NoteController::class, 'store']);     // crea
        Route::put('/{id}', [NoteController::class, 'update']); // aggiorna
        Route::delete('/{id}', [NoteController::class, 'destroy']);
    });
    
    Route::get('notes/export/{id}', [ExportController::class, 'export']);
    Route::post('notes/export', [ExportController::class, 'exportRaw']);
    
    Route::post('notes/import',ImportController::class); 

    Route::post('/llm', LlmController::class);
?>
