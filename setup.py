#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(
    name="taxsarthi",
    version="1.0.0",
    description="TaxSarthi - Deterministic Indian Income Tax Return (ITR) Engine & AI Co-Pilot for AY 2026-27",
    author="TaxSarthi Contributors",
    license="MIT",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "taxsarthi=taxsarthi.cli.main:main",
        ],
    },
    python_requires=">=3.9",
)
