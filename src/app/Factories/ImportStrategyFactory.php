<?php
    namespace App\Factories;

    use App\Strategies\ImportStrategyInterface;
    use App\Strategies\MdImport;
    use InvalidArgumentException;

    class ImportStrategyFactory {
        public function make (string $extension) : ImportStrategyInterface {
            return match ($extension) {
                'md' => new MdImport(),
                default => throw new InvalidArgumentException("{$extension} format is not supported"),
            };
        }
    }
?>