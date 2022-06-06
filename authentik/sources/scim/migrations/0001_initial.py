# Generated by Django 4.0.5 on 2022-06-06 21:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("authentik_core", "0020_application_open_in_new_tab"),
    ]

    operations = [
        migrations.CreateModel(
            name="SCIMSource",
            fields=[
                (
                    "source_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="authentik_core.source",
                    ),
                ),
                (
                    "token",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="authentik_core.token",
                    ),
                ),
            ],
            options={
                "verbose_name": "SCIM Source",
                "verbose_name_plural": "SCIM Sources",
            },
            bases=("authentik_core.source",),
        ),
    ]
