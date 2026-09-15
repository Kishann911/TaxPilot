"""TaxSarthi - Intelligent, Deterministic Indian Income Tax (ITR) Engine & Co-Pilot

Assessment Year: 2026-27 (Financial Year: 2025-26)
"""

__version__ = "1.0.0"
__author__ = "TaxSarthi Contributors"

try:
    from taxsarthi.core.tax_engine import compute_tax
    from taxsarthi.core.validate_income import validate_file
    __all__ = ["compute_tax", "validate_file", "__version__"]
except ImportError:
    __all__ = ["__version__"]
