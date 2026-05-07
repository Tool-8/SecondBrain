<?php
    namespace App\Strategies;

    use App\Strategies\ExportStrategyInterface;

    class MdExport implements ExportStrategyInterface {
        public function export(string $content, string $title) : string {
            return $content;
        }

        public function contentType() : string {
            return 'text/markdown';
        }
        
        public function extension() : string{
            return 'md';
        
        }
    }
?>