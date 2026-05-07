<?php
    namespace App\Strategies;

    use Illuminate\Http\UploadedFile;

    interface ImportStrategyInterface {
        public function parse(UploadedFile $file) : array;
    }
?>