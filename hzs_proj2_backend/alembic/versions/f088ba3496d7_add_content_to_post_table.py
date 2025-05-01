"""add content to post table

Revision ID: f088ba3496d7
Revises: 57f8f82da4a7
Create Date: 2025-02-23 17:25:02.068149

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f088ba3496d7'
down_revision: Union[str, None] = '57f8f82da4a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('content', sa.String, nullable=False))
    pass


def downgrade() -> None:
    op.drop_column('posts', 'content')
    pass
