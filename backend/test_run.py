import sys
import traceback

try:
    import main
except Exception as e:
    print("=" * 80)
    print("FULL ERROR TRACEBACK:")
    print("=" * 80)
    traceback.print_exc()
    print("=" * 80)
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("=" * 80)
    sys.exit(1)
