import base64

from app.ai.attachments import InboundAttachment, from_local_path, to_claude_block


def test_to_claude_block_with_inline_data():
    att = InboundAttachment(
        kind="image",
        media_type="image/png",
        data_b64=base64.standard_b64encode(b"\x89PNG\r\n").decode(),
    )
    block = to_claude_block(att)
    assert block is not None
    assert block["type"] == "image"
    assert block["source"]["media_type"] == "image/png"


def test_to_claude_block_unsupported_kind():
    assert to_claude_block(InboundAttachment(kind="audio")) is None


def test_to_claude_block_unsupported_media_type():
    att = InboundAttachment(kind="image", media_type="image/tiff", data_b64="aGk=")
    assert to_claude_block(att) is None


def test_from_local_path_reads_png(tmp_path):
    png = tmp_path / "x.png"
    png.write_bytes(b"\x89PNG\r\n\x1a\nfake")
    att = from_local_path(png)
    assert att.media_type == "image/png"
    assert att.data_b64 is not None
    assert base64.standard_b64decode(att.data_b64).startswith(b"\x89PNG")


def test_from_local_path_rejects_unknown_extension(tmp_path):
    f = tmp_path / "x.txt"
    f.write_text("hi")
    try:
        from_local_path(f)
    except ValueError:
        return
    raise AssertionError("expected ValueError")
