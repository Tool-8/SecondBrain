<?php
    namespace App\Strategies;

    interface ExportStrategyInterface {
        public function export(string $content, string $title) : string;
        public function contentType() : string;
        public function extension() : string; 
    }

?>