<?php

    namespace App\Factories;

    use App\Strategies\ExportStrategyInterface;
    use App\Strategies\HtmlExport;
    use App\Strategies\MdExport;
    use App\Strategies\PdfExport;
    use InvalidArgumentException;
    use Parsedown;

    class ExportStrategyFactory {
        public function make(string $format) : ExportStrategyInterface {
            return match ($format) {
                'md' => new MdExport(),
                'html' => new HtmlExport(new Parsedown()),
                'pdf' => new PdfExport(new Parsedown()),
        
                default => throw new InvalidArgumentException("Unknown format: {$format}"),
            };
        }
    }
?>