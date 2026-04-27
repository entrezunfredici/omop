"""Extended validator tests covering model name format and additional edge cases."""

import unittest

from python.odoo_connector.errors import ValidationError
from python.odoo_connector.validators import (
    validate_action_payload,
    validate_model_name,
    validate_odoo_create_payload,
    validate_odoo_delete_payload,
)


class ModelNameValidationTest(unittest.TestCase):
    def test_valid_model_names(self) -> None:
        for name in ("project.task", "res.partner", "account.move.line", "sale.order"):
            with self.subTest(name=name):
                validate_model_name("odoo_read", name)  # must not raise

    def test_rejects_empty_model(self) -> None:
        with self.assertRaises(ValidationError):
            validate_model_name("odoo_read", "")

    def test_rejects_path_traversal(self) -> None:
        for bad in ("../../etc/passwd", "../secret", "res partner", "RES.PARTNER"):
            with self.subTest(bad=bad):
                with self.assertRaises(ValidationError):
                    validate_model_name("odoo_read", bad)

    def test_rejects_no_dot(self) -> None:
        with self.assertRaises(ValidationError):
            validate_model_name("odoo_read", "projecttask")

    def test_rejects_uppercase(self) -> None:
        with self.assertRaises(ValidationError):
            validate_model_name("odoo_read", "Project.Task")

    def test_non_crud_action_skips_format_check(self) -> None:
        # odoo_list_models has no model constraint
        validate_model_name("odoo_list_models", "")  # must not raise


class CreatePayloadValidationTest(unittest.TestCase):
    def test_requires_values_or_template_id(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_create_payload({})

    def test_accepts_values(self) -> None:
        validate_odoo_create_payload({"values": {"name": "x"}})

    def test_accepts_template_id(self) -> None:
        validate_odoo_create_payload({"template_id": "tmpl_1"})

    def test_rejects_empty_values_dict(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_create_payload({"values": {}})

    def test_rejects_empty_template_id(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_create_payload({"template_id": "  "})


class DeletePayloadValidationTest(unittest.TestCase):
    def test_accepts_single_integer_id(self) -> None:
        validate_odoo_delete_payload({"id": 5})

    def test_accepts_ids_list(self) -> None:
        validate_odoo_delete_payload({"ids": [1, 2, 3]})

    def test_rejects_missing_id(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_delete_payload({})

    def test_rejects_empty_ids_list(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_delete_payload({"ids": []})

    def test_rejects_string_in_ids_list(self) -> None:
        with self.assertRaises(ValidationError):
            validate_odoo_delete_payload({"ids": [1, "two", 3]})

    def test_rejects_bool_as_id(self) -> None:
        # bool is a subclass of int in Python — must be explicitly rejected
        with self.assertRaises(ValidationError):
            validate_odoo_delete_payload({"id": True})


class ReadPayloadValidationTest(unittest.TestCase):
    def test_accepts_valid_fields_and_filters(self) -> None:
        validate_action_payload(
            "odoo_read",
            {"fields": ["id", "name"], "filters": [["active", "=", True]], "limit": 10},
            "project.task",
        )

    def test_rejects_non_string_in_fields(self) -> None:
        with self.assertRaises(ValidationError):
            validate_action_payload("odoo_read", {"fields": ["id", 42]}, "project.task")

    def test_rejects_float_limit(self) -> None:
        with self.assertRaises(ValidationError):
            validate_action_payload("odoo_read", {"limit": 10.5}, "project.task")


if __name__ == "__main__":
    unittest.main()
