"""empty message

Revision ID: 10d17b933f69
Revises: b8781b30554e
Create Date: 2024-11-04 18:28:34.500968

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '10d17b933f69'
down_revision = 'b8781b30554e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('inventory_items', schema=None) as batch_op:
        batch_op.alter_column('distribution_date',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=True)

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('reset_token_expires')
        batch_op.drop_column('reset_token')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reset_token', sa.VARCHAR(length=100), nullable=True))
        batch_op.add_column(sa.Column('reset_token_expires', sa.DATETIME(), nullable=True))

    with op.batch_alter_table('inventory_items', schema=None) as batch_op:
        batch_op.alter_column('distribution_date',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=True)

    # ### end Alembic commands ###
