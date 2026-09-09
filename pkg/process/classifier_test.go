package process

import "testing"

func TestClassifyProcessNormalizesNames(t *testing.T) {
	got := ClassifyProcess("  EXPLORER.EXE ")
	if got.Category != CategoryProtected {
		t.Fatalf("expected protected category, got %q", got.Category)
	}
}

func TestClassifyProcessUsesSafeFallback(t *testing.T) {
	got := ClassifyProcess("my-game.exe")
	if got.Category != CategorySafe {
		t.Fatalf("expected safe fallback category, got %q", got.Category)
	}
	if got.Description == "" {
		t.Fatal("expected fallback description")
	}
}

func TestClassifyProcessRecognizesBackgroundHeuristic(t *testing.T) {
	got := ClassifyProcess("update-broker.exe")
	if got.Category != CategoryBackground {
		t.Fatalf("expected background category, got %q", got.Category)
	}
}
