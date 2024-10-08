import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobDocument } from 'jobs/schema/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from 'subscribers/schema/subscriber.schema';

@Injectable()
export class MailService {
  constructor(
    @InjectModel('Subscriber')
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel('Job')
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async findJobs() {
    const subscribers = await this.subscriberModel.find({});

    let jobs = [];
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      if (jobWithMatchingSkills.length > 0) {
        jobs = jobWithMatchingSkills.map((job) => ({
          name: job.name,
          company: job.company.name,
          salary: `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ', ') + ' đ',
          skills: job.skills,
        }));
      }
    }

    return jobs;
  }
}
