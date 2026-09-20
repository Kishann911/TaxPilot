#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(
    name="taxpilot",
    version="1.0.0",
    description="TaxPilot - Deterministic Indian Income Tax Return (ITR) Engine & AI Co-Pilot for AY 2026-27",
    author="Kishan Ojha",
    author_email="kishanojha462@gmail.com",
    url="https://github.com/Kishann911/TaxPilot",
    license="MIT",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "taxpilot=taxpilot.cli.main:main",
            "taxsarthi=taxpilot.cli.main:main",
        ],
    },
    python_requires=">=3.9",
)

