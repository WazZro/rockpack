import { Model, DataTypes } from 'sequelize';
import { statisticFactory } from './Statistic';
import { statisticTypeFactory } from './StatisticType';

export interface PostInterface {
  id: number;
  user_id: number;
  post_id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const commentFactory = (sequelize) => {
  class Comment extends Model<PostInterface> {
  }

  Comment.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      }
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  }, {
    tableName: 'comments',
    sequelize,
    hooks: {
      afterCreate: async (comment) => {
        const Statistic = statisticFactory(sequelize);
        const StatisticType = statisticTypeFactory(sequelize);

        const userType = await StatisticType.findOne({
          where: {
            type: 'user'
          }
        });

        const postType = await StatisticType.findOne({
          where: {
            type: 'post'
          }
        });

        await Statistic.update(
          {
            comments: sequelize.literal('comments + 1')
          },
          {
            where: {
              type_id: userType.get('id'),
              entity_id: comment.get('user_id')
            }
          }
        );

        await Statistic.update(
          {
            comments: sequelize.literal('comments + 1')
          },
          {
            where: {
              type_id: postType.get('id'),
              entity_id: comment.get('post_id')
            }
          }
        );
      },

      afterDestroy: async (comment) => {
        const Statistic = statisticFactory(sequelize);
        const StatisticType = statisticTypeFactory(sequelize);

        const userType = await StatisticType.findOne({
          where: {
            type: 'user'
          }
        });

        const postType = await StatisticType.findOne({
          where: {
            type: 'post'
          }
        });

        await Statistic.update(
          {
            comments: sequelize.literal('comments - 1')
          },
          {
            where: {
              type_id: postType.get('id'),
              entity_id: comment.get('post_id')
            }
          }
        );

        await Statistic.update(
          {
            comments: sequelize.literal('comments - 1')
          },
          {
            where: {
              type_id: userType.get('id'),
              entity_id: comment.get('user_id')
            }
          }
        );
      }
    }
  });

  Comment.sync();

  return Comment;
};
