from __future__ import annotations

import unittest
from email.message import Message
from urllib.error import HTTPError
from unittest.mock import MagicMock, patch

from site_health.http_probe import _result, fetch


class HttpProbeRedirectTests(unittest.TestCase):
    def test_result_keeps_first_hop(self) -> None:
        row = _result(
            url="http://real-besedki.ru/",
            final_url="https://real-besedki.ru/",
            status=200,
            headers={},
            body="",
            chain=[
                {"url": "http://real-besedki.ru/", "status": 301, "location": "https://real-besedki.ru/"},
                {"url": "https://real-besedki.ru/", "status": 200, "location": None},
            ],
            error=None,
            ssl_error=False,
        )
        self.assertEqual(row["first_status"], 301)
        self.assertEqual(row["status"], 200)
        self.assertEqual(row["redirect_count"], 1)

    def test_fetch_records_301_then_200(self) -> None:
        err = HTTPError(
            "http://example.test/",
            301,
            "Moved Permanently",
            Message(),
            fp=None,
        )
        err.headers = Message()
        err.headers["Location"] = "https://example.test/"

        final = MagicMock()
        final.status = 200
        final.headers = Message()
        final.get_content_charset.return_value = "utf-8"
        final.read.return_value = b"ok"
        final.geturl.return_value = "https://example.test/"
        final.__enter__.return_value = final
        final.__exit__.return_value = False

        opener = MagicMock()
        opener.open.side_effect = [err, final]
        with patch("site_health.http_probe._opener", return_value=opener):
            row = fetch("http://example.test/")
        self.assertEqual(row["first_status"], 301)
        self.assertEqual(row["status"], 200)
        self.assertEqual(row["final_url"], "https://example.test/")
        self.assertEqual(row["redirect_count"], 1)


if __name__ == "__main__":
    unittest.main()
