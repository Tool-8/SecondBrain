<?php

    namespace Tests\Unit\Services;

    use App\Factories\LlmStrategyFactory;
    use App\Services\LlmService;
    use App\Strategies\LlmStrategyInterface;
    use PHPUnit\Framework\MockObject\MockObject;
    use PHPUnit\Framework\TestCase;
    use InvalidArgumentException;
    use App\Utilities\Context;

    class LlmServiceTest extends TestCase {
        private LlmStrategyFactory&MockObject $factoryMock;
        private LlmService $service;

        protected function setUp(): void {
            $this->factoryMock = $this->createMock(LlmStrategyFactory::class);
            $this->service = new LlmService($this->factoryMock);
        }

        public function test_process_returns_strategy_result(): void {
            $strategyMock = $this->createMock(LlmStrategyInterface::class);
            $strategyMock
                ->expects($this->once())
                ->method('process')
                ->willReturn('expected output');

            $this->factoryMock
                ->expects($this->once())
                ->method('make')
                ->with('summarize')
                ->willReturn($strategyMock);

            $result = $this->service->process('Hello world', 'summarize');

            $this->assertSame('expected output', $result);
        }

        public function test_process_returns_empty_string_when_strategy_returns_empty(): void {
            $strategyMock = $this->createMock(LlmStrategyInterface::class);
            $strategyMock->method('process')->willReturn('Risposta vuota');

            $this->factoryMock->method('make')->willReturn($strategyMock);

            $result = $this->service->process('content', 'action');

            $this->assertSame('Risposta vuota', $result);
        }

        public function test_process_propagates_exception_from_factory(): void {
            $this->factoryMock
                ->method('make')
                ->willThrowException(new InvalidArgumentException('Unknown action'));

            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage('Unknown action');

            $this->service->process('content', 'unknown_action');
        }
    }